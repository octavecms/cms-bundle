<?php

namespace VideInfra\CMSBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use VideInfra\CMSBundle\Entity\Page;
use VideInfra\CMSBundle\Form\CustomPageType;
use VideInfra\CMSBundle\PageType\BlockPageType;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class BlockController extends Controller
{
    public function editAction(Request $request, Page $page = null)
    {
        // @TODO This is copied from SimpleTextController to make form
        // show up

        $isNew = !$page;
        $pageRepository = $this->get('vig.cms.page.repository');
        $isAdmin = ($this->getParameter('vig.cms.super_admin_role'))
            ? $this->get('security.authorization_checker')
                ->isGranted($this->getParameter('vig.cms.super_admin_role'))
            : true;

        if (!$page) {
            $page = $pageRepository->create();
            $page->setType(BlockPageType::TYPE);
        }

        $form = $this->createForm(CustomPageType::class, $page, [
            'method' => 'post'
        ]);
        $form->handleRequest($request);

        return $this->render('VideInfraCMSBundle:Block:edit.html.twig', [
            'page' => $page,
            'form' => $form->createView(),
            'isNew' => $isNew,
            'isAdmin' => $isAdmin
        ]);
    }
}