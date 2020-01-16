<?php

namespace Octave\CMSBundle\Controller;

use Doctrine\Common\Collections\ArrayCollection;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Octave\CMSBundle\Entity\Block;
use Octave\CMSBundle\Entity\Page;
use Octave\CMSBundle\Form\Type\FlexiblePageType as FlexiblePageForm;
use Octave\CMSBundle\Page\Type\FlexiblePageType;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class FlexiblePageController extends Controller
{
    /**
     * @param Request $request
     * @param Page|null $page
     * @param null $version
     * @return \Symfony\Component\HttpFoundation\Response
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

        $form = $this->createForm(FlexiblePageForm::class, $page, [
            'method' => 'post',
            'block_types' => $blockManager->getBlocks(),
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
                }
            }
            else {
                $em->flush();
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
                    return $this->redirectToRoute('sitemap_page_create_type', ['type' => FlexiblePageForm::TYPE]);
                }
            }
        }

        return $this->render('OctaveCMSBundle:FlexiblePage:edit.html.twig', [
            'page' => $page,
            'form' => $form->createView(),
            'isNew' => $isNew,
            'isAdmin' => $isAdmin,
            'version' => $version
        ]);
    }

    /**
     * @param Page $page
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function showAction(Page $page)
    {
        $template = $page->getBaseTemplate()
            ? $page->getBaseTemplate()
            : $this->getParameter('octave.cms.flexible_page_template');
        return $this->render($template, [
            'page' => $page,
            'content' => $this->get('octave.cms.block.manager')->renderPage($page)
        ]);
    }
}