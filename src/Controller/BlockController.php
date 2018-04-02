<?php

namespace VideInfra\CMSBundle\Controller;

use Doctrine\Common\Collections\ArrayCollection;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use VideInfra\CMSBundle\Entity\Block;
use VideInfra\CMSBundle\Entity\Page;
use VideInfra\CMSBundle\Form\Type\BlockType;
use VideInfra\CMSBundle\Page\Type\BlockPageType;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class BlockController extends Controller
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
        $blockManager = $this->get('vig.cms.block.manager');
        $pageRepository = $this->get('vig.cms.page.repository');
        $isAdmin = ($this->getParameter('vig.cms.super_admin_role'))
            ? $this->get('security.authorization_checker')
                ->isGranted($this->getParameter('vig.cms.super_admin_role'))
            : true;
        $isPublish = $request->get('publish');

        if (!$page) {
            $page = $pageRepository->create();
            $page->setType(BlockPageType::TYPE);
        }

        $originalBlocks = new ArrayCollection();
        foreach ($page->getBlocks() as $block) {
            $originalBlocks->add($block);
        }

        $pageType = $this->get('vig.cms.page_type.factory')->get($page->getType());

        if ($version && $isPublish) {

            $versionRepository = $this->get('vig.cms.page_version.repository');
            $pageVersion = $versionRepository->findOneByVersion($page, $version);
            if ($pageVersion) {
                $page = $pageType->unserialize($pageVersion);
            }
        }

        $form = $this->createForm(BlockType::class, $page, [
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

            $page->setController($this->getParameter('vig.cms.block_controller'));
            $page->setOption('id', $page->getId());

            /** @var Block $block */
            foreach ($page->getBlocks() as $block) {
                $block->setPage($page);
            }

            if ($version) {

                $newVersion = $this->get('vig.cms.page.version.manager')->storeVersion($page, $version);

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

                    $options = ['id' => $page->getId()];
                    if ($version) {
                        $options['version'] = $version;
                    }

                    return $this->redirectToRoute('sitemap_page_edit', $options);
                }
            }
            else {
                if ($request->get('create_and_list')) {
                    return $this->redirectToRoute('sitemap_list');
                }
                else {
                    return $this->redirectToRoute('sitemap_page_create_type', ['type' => BlockPageType::TYPE]);
                }
            }
        }

        return $this->render('VideInfraCMSBundle:Block:edit.html.twig', [
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
        $template = $this->getParameter('vig.cms.block_template');
        return $this->render($template, [
            'page' => $page,
            'content' => $this->get('vig.cms.block.manager')->renderPage($page)
        ]);
    }
}