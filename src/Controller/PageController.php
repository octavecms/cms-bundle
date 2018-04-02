<?php

namespace VideInfra\CMSBundle\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use VideInfra\CMSBundle\Entity\Page;
use VideInfra\CMSBundle\Entity\PageTranslation;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class PageController extends AbstractController
{
    /**
     * @param $type
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function createPageAction($type)
    {
        $pageType = $this->get('vig.cms.page_type.factory')->get($type);

        return $this->forward($pageType->getController());
    }

    /**
     * @param Request $request
     * @param null $id
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function editAction(Request $request, $id = null)
    {
        $page = $this->get('vig.cms.page.repository')->find($id);
        if (!$page) {
            throw new NotFoundHttpException(sprintf('Unable to find Page entity with id %s', $id));
        }

        $pageType = $this->get('vig.cms.page_type.factory')->get($page->getType());

        $usePageVersions = $this->getParameter('vig.cms.page_use_versions');
        $version = $request->get('version');
        $isPublish = $request->get('publish');

        $options = ['page' => $page, 'version' => $version];

        if ($usePageVersions && $version && !$isPublish) {

            $versionRepository = $this->get('vig.cms.page_version.repository');

            $pageVersion = $versionRepository->findOneByVersion($page, $version);
            if (!$pageVersion) {
                   $pageVersion = $versionRepository->create($page, $version);
                   $pageVersion->setContent(json_encode($pageType->serialize($page)));
                   $this->getDoctrine()->getManager()->flush($pageVersion);
            }
            else {
                $page = $pageType->unserialize($pageVersion);
            }

            $options = ['page' => $page, 'version' => $version];
        }

        return $this->forward($pageType->getController(), $options);
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function createAction(Request $request)
    {
        try {
            $parentId = $request->get('reference');
            $title = $request->get('title');
            $path = $request->get('path');
            $typeId = $request->get('type');

            if (empty($parentId)) {
                throw new \Exception('Parent is required');
            }

            if (empty($title)) {
                throw new \Exception('Title is required');
            }

            if (empty($path)) {
                throw new \Exception('Path is required');
            }

            $pageRepository = $this->get('vig.cms.page.repository');

            /** @var Page|null $parent */
            $parent = null;
            if ($parentId != 'root') {
                $parent = $pageRepository->find($parentId);
                if (!$parent) {
                    throw new \Exception(sprintf('Page with id %s not found', $parentId));
                }
            }

            if ($path[0] !== '/') {
                $path = $parent->getPath() . '/' . $path;
            }

            $type = $this->get('vig.cms.page_type.factory')->get($typeId);
            if ($type->canCreateRole() && !$this->get('security.authorization_checker')->isGranted($type->canCreateRole())) {
                throw new AccessDeniedException(sprintf('You are not allowed to create page with %s type', $typeId));
            }

            $page = $pageRepository->create();
            $page->setPath($path);
            $page->setType($type->getName());
            $page->setName($type->getName() . '_' . time());
            $page->setParent($parent);
            $page->setPosition($pageRepository->getNewPosition($parent));

            $translation = new PageTranslation();
            $translation->setTitle($title);
            $translation->setTranslatable($page);
            $translation->setLocale($request->getLocale());
            $page->addTranslation($translation);

            $validator = $this->get('validator');
            $errors = $validator->validate($page);

            if (count($errors) > 0) {
                throw new \Exception((string) $errors);
            }

            $em = $this->getDoctrine()->getManager();
            $em->persist($translation);
            $em->flush();

            return new JsonResponse([
                'status' => true,
                'data' => $this->get('vig.cms.page.serializer')->toArray($page)
            ]);

        }
        catch (\Exception $e) {
            return $this->generateJsonErrorResponse($e);
        }
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function removeAction(Request $request)
    {
        try {
            $em = $this->getDoctrine()->getManager();

            $id = $request->get('id');
            if (empty($id)) {
                throw new \Exception('Id is missing');
            }

            /** @var Page $page */
            $page = $this->get('vig.cms.page.repository')->find($id);
            if (!$page) {
                throw new \Exception(sprintf('Unable to find page with id %s', $id));
            }

            $type = $this->get('vig.cms.page_type.factory')->get($page->getType());
            if ($type->canCreateRole() && !$this->get('security.authorization_checker')->isGranted($type->canCreateRole())) {
                throw new AccessDeniedException(sprintf('You are not allowed to remove page with %s type',
                    $page->getType()));
            }

            $em->remove($page);
            $em->flush();

            return new JsonResponse(['status' => true]);
        }
        catch (\Exception $e) {
            return $this->generateJsonErrorResponse($e);
        }
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function moveAction(Request $request)
    {
        try {
            $em = $this->getDoctrine()->getManager();

            $referenceId = $request->get('reference');
            $position = $request->get('position');
            $id = $request->get('id');
            if (empty($id)) {
                throw new \Exception('Id is missing');
            }

            if (empty($referenceId)) {
                throw new \Exception('Reference is missing');
            }

            $pageRepository = $this->get('vig.cms.page.repository');

            /** @var Page|null $reference */
            $reference = null;
            if ($referenceId != 'root') {
                $reference = $pageRepository->find($referenceId);
                if (!$reference) {
                    throw new \Exception(sprintf('Unable to find Page with id %s', $referenceId));
                }
            }

            /** @var Page $page */
            $page = $pageRepository->find($id);
            if (!$page) {
                throw new \Exception(sprintf('Unable to find page with id %s', $id));
            }

            if ($position == 'inside') {
                $page->setParent($reference);
            }

            if ($position == 'before') {

                $page->setParent($reference->getParent());

                $pageRepository->increasePositionAfter($reference);
                $page->setPosition($reference->getPosition());
                $reference->setPosition($page->getPosition() + 1);
            }

            if ($position == 'after') {

                $page->setParent($reference->getParent());
                $page->setPosition($reference->getPosition() + 1);
                $pageRepository->increasePositionAfter($page);
            }

            $em->flush();

            return new JsonResponse(['status' => true]);
        }
        catch (\Exception $e) {
            return $this->generateJsonErrorResponse($e);
        }
    }
}