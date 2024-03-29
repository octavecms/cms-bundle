<?php

namespace Octave\CMSBundle\Controller;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManager;
use Symfony\Component\HttpFoundation\Request;
use Octave\CMSBundle\Entity\Block;
use Octave\CMSBundle\Entity\Page;
use Octave\CMSBundle\Form\Type\FlexiblePageType as FlexiblePageForm;
use Octave\CMSBundle\Page\Type\FlexiblePageType;
use Symfony\Component\HttpFoundation\Response;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class FlexiblePageController extends AbstractController
{
    /**
     * @param Request $request
     * @param Page|null $page
     * @param null $version
     * @return Response
     * @throws \Exception
     */
    public function editAction(Request $request, Page $page = null, $version = null)
    {
        $isNew = !$page;
        $blockManager = $this->get('octave.cms.block.manager');
        $pageRepository = $this->get('octave.cms.page.repository');
        $isAdmin = ($this->getParameter('octave.cms.super_admin_role'))
            ? $this->get('security.authorization_checker')
                ->isGranted($this->getParameter('octave.cms.super_admin_role'))
            : true;
        $isPublish = $request->get('publish');

        if (!$page) {
            $page = $pageRepository->create();
            $page->setType(FlexiblePageType::TYPE);
        }

        $originalBlocks = new ArrayCollection();
        foreach ($page->getBlocks() as $block) {
            $originalBlocks->add($block);
        }

        $pageType = $this->get('octave.cms.page_type.factory')->get($page->getType());

        if ($version && $isPublish) {

            $versionRepository = $this->get('octave.cms.page_version.repository');
            $pageVersion = $versionRepository->findOneByVersion($page, $version);
            if ($pageVersion) {
                $page = $pageType->unserialize($pageVersion);
            }
        }

        $routeOptions = $this->get('octave.cms.page.manager')->getRouteOptions($page->getName());
        $blocks = isset($routeOptions['block_types']) && $routeOptions['block_types']
            ? $blockManager->getBlocksByName($routeOptions['block_types'])
            : $blockManager->getBlocks();

        $form = $this->createForm(FlexiblePageForm::class, $page, [
            'method' => 'post',
            'block_types' => $blocks,
            'locales' => $this->getParameter('locales'),
            'is_admin' => $isAdmin
        ]);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {

            /** @var EntityManager $em */
            $em = $this->getDoctrine()->getManager();

            if (!$page->getName()) {
                $page->setName(sprintf('simple_text_%s', time()));
            }

            $page->setController($this->getParameter('octave.cms.flexible_page_controller'));
            $page->setOption('id', $page->getId());

            /** @var Block $block */
            foreach ($page->getBlocks() as $block) {
                $block->setPage($page);
            }

            if ($version) {

                $newVersion = $this->get('octave.cms.page.version.manager')->storeVersion($page, $version);

                if ($isPublish) {

                    $page = $pageType->unserialize($newVersion);

                    foreach ($originalBlocks as $originalBlock) {

                        if (false === $page->getBlocks()->contains($originalBlock)) {
                            $page->getBlocks()->removeElement($originalBlock);
                            $em->remove($originalBlock);
                        }
                    }

                    $em->flush();
                    $this->warmUpRouteCache();

                    return $this->redirectToRoute('sitemap_list');
                }
            }
            else {
                $em->flush();
                $this->warmUpRouteCache();
            }

            if (!$isNew) {

                if ($request->get('update_and_list')) {
                    return $this->redirectToRoute('sitemap_list');
                }
                else {
                    return $this->redirectToRoute('sitemap_page_edit', ['id' => $page->getId()]);
                }
            }
            else {
                if ($request->get('create_and_list')) {
                    return $this->redirectToRoute('sitemap_list');
                }
                else {
                    return $this->redirectToRoute('sitemap_page_create_type', ['type' => FlexiblePageType::TYPE]);
                }
            }
        }

        $freeze = count($page->getBlocks()) && $this->getParameter('octave.cms.freeze_page_blocks_after_creation') &&
            !$request->get('unfreeze');

        return $this->render('OctaveCMSBundle:FlexiblePage:edit.html.twig', [
            'page' => $page,
            'form' => $form->createView(),
            'isNew' => $isNew,
            'freeze' => $freeze,
            'collapseBox' => $this->getParameter('octave.cms.collapse_blocks_by_default'),
            'isAdmin' => $isAdmin,
            'version' => $version
        ]);
    }

    /**
     * @param Page $page
     * @param Request $request
     * @return Response
     * @throws \Exception
     */
    public function showAction(Page $page, Request $request)
    {
        $blockManager = $this->get('octave.cms.block.manager');

        if ($this->getParameter('octave.cms.handle_xhr_requests') && $request->isXmlHttpRequest()) {
            $response = new Response();
            $response->setContent($blockManager->renderPage($page));
            return $response;
        }

        $template = $page->getBaseTemplate()
            ? $page->getBaseTemplate()
            : $this->getParameter('octave.cms.flexible_page_template');

        return $this->render($template, [
            'page' => $page,
            'content' => $blockManager->renderPage($page)
        ]);
    }
}