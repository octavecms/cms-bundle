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
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function editAction(Request $request, Page $page = null)
    {
        $isNew = !$page;
        $blockManager = $this->get('vig.cms.block.manager');
        $pageRepository = $this->get('vig.cms.page.repository');
        $isAdmin = ($this->getParameter('vig.cms.super_admin_role'))
            ? $this->get('security.authorization_checker')
                ->isGranted($this->getParameter('vig.cms.super_admin_role'))
            : true;

        if (!$page) {
            $page = $pageRepository->create();
            $page->setType(BlockPageType::TYPE);
        }

        $originalBlocks = new ArrayCollection();
        foreach ($page->getBlocks() as $block) {
            $originalBlocks->add($block);
        }

        $form = $this->createForm(BlockType::class, $page, [
            'method' => 'post',
            'block_types' => $blockManager->getBlocks()
        ]);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {

            /** @var EntityManager $em */
            $em = $this->getDoctrine()->getManager();

            $page->setController($this->getParameter('vig.cms.simple_text_controller'));
            $page->setOption('id', $page->getId());

            foreach ($originalBlocks as $originalBlock) {

                if (false === $page->getBlocks()->contains($originalBlock)) {
                    $page->getBlocks()->removeElement($originalBlock);
                    $em->remove($originalBlock);
                }
            }

            /** @var Block $block */
            foreach ($page->getBlocks() as $block) {
                $block->setPage($page);
            }

            $em->flush();

            if (!$isNew) {

                if ($request->get('update_and_list')) {
                    return $this->redirectToRoute('admin_videinfra_cms_page_list');
                }
                else {
                    return $this->redirectToRoute('admin_videinfra_cms_page_edit', ['id' => $page->getId()]);
                }
            }
            else {
                if ($request->get('create_and_list')) {
                    return $this->redirectToRoute('admin_videinfra_cms_page_list');
                }
                else {
                    return $this->redirectToRoute('admin_videinfra_cms_page_create_type', ['type' => 'custom']);
                }
            }
        }

        return $this->render('VideInfraCMSBundle:Block:edit.html.twig', [
            'page' => $page,
            'form' => $form->createView(),
            'isNew' => $isNew,
            'isAdmin' => $isAdmin
        ]);
    }
}